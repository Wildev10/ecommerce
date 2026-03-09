<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use App\Models\DisputeMessage;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class DisputeController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/disputes — Mes litiges (acheteur) ou tous (admin)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Dispute::with(['order:id,order_number,total', 'user:id,name,email']);

        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $disputes = $query->latest()->paginate($request->get('per_page', 15));

        return $this->paginated($disputes, 'Liste des litiges');
    }

    /**
     * POST /api/disputes — Ouvrir un litige (acheteur)
     */
    public function store(Request $request)
    {
        $request->validate([
            'order_id'    => 'required|exists:orders,id',
            'subject'     => 'required|string|max:255',
            'description' => 'required|string|max:2000',
        ]);

        $order = Order::where('id', $request->order_id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // One open dispute per order
        $existing = Dispute::where('order_id', $order->id)
            ->whereIn('status', ['open', 'in_progress'])
            ->first();

        if ($existing) {
            return $this->error('Un litige est déjà ouvert pour cette commande.', 409);
        }

        $dispute = Dispute::create([
            'order_id'    => $order->id,
            'user_id'     => $request->user()->id,
            'subject'     => $request->subject,
            'description' => $request->description,
            'status'      => 'open',
        ]);

        // Create first message
        DisputeMessage::create([
            'dispute_id' => $dispute->id,
            'user_id'    => $request->user()->id,
            'message'    => $request->description,
            'is_admin'   => false,
        ]);

        $dispute->load(['order:id,order_number,total', 'messages.user:id,name']);

        return $this->success($dispute, 'Litige ouvert avec succès', 201);
    }

    /**
     * GET /api/disputes/{id} — Détails d'un litige
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $dispute = Dispute::with(['order:id,order_number,total,status', 'user:id,name,email', 'messages.user:id,name', 'resolvedBy:id,name'])
            ->findOrFail($id);

        if (!$user->isAdmin() && $dispute->user_id !== $user->id) {
            return $this->error('Non autorisé', 403);
        }

        return $this->success($dispute, 'Détail du litige');
    }

    /**
     * POST /api/disputes/{id}/messages — Ajouter un message
     */
    public function addMessage(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $user = $request->user();
        $dispute = Dispute::findOrFail($id);

        if (!$user->isAdmin() && $dispute->user_id !== $user->id) {
            return $this->error('Non autorisé', 403);
        }

        if (in_array($dispute->status, ['resolved', 'closed'])) {
            return $this->error('Ce litige est clôturé.', 400);
        }

        $message = DisputeMessage::create([
            'dispute_id' => $dispute->id,
            'user_id'    => $user->id,
            'message'    => $request->message,
            'is_admin'   => $user->isAdmin(),
        ]);

        // If admin replies to open dispute, move to in_progress
        if ($user->isAdmin() && $dispute->status === 'open') {
            $dispute->update(['status' => 'in_progress']);
        }

        $message->load('user:id,name');

        return $this->success($message, 'Message ajouté', 201);
    }

    /**
     * PUT /api/admin/disputes/{id}/status — Changer le statut (admin)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status'     => 'required|in:in_progress,resolved,closed',
            'resolution' => 'required_if:status,resolved|nullable|string|max:2000',
        ]);

        $dispute = Dispute::findOrFail($id);

        $data = ['status' => $request->status];

        if ($request->status === 'resolved') {
            $data['resolution']  = $request->resolution;
            $data['resolved_by'] = $request->user()->id;
            $data['resolved_at'] = now();
        }

        $dispute->update($data);

        $dispute->load(['order:id,order_number', 'user:id,name', 'resolvedBy:id,name']);

        return $this->success($dispute, 'Statut du litige mis à jour');
    }
}
