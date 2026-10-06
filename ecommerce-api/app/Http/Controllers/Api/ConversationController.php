<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/conversations — Mes conversations
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $conversations = Conversation::where('buyer_id', $userId)
            ->orWhere('seller_id', $userId)
            ->with(['buyer:id,name,avatar', 'seller:id,name,avatar', 'product:id,name,image', 'lastMessage'])
            ->latest('updated_at')
            ->paginate($request->get('per_page', 20));

        // Attach unread count
        $conversations->getCollection()->transform(function ($conv) use ($userId) {
            $conv->unread_count = $conv->unreadCountFor($userId);
            return $conv;
        });

        return $this->paginated($conversations, 'Mes conversations');
    }

    /**
     * POST /api/conversations — Démarrer ou reprendre une conversation
     */
    public function store(Request $request)
    {
        $request->validate([
            'seller_id'  => 'required|exists:users,id',
            'product_id' => 'nullable|exists:products,id',
            'message'    => 'nullable|string|max:2000',
        ]);

        $user = $request->user();

        if ($user->id == $request->seller_id) {
            return $this->error('Vous ne pouvez pas vous envoyer un message.', 400);
        }

        $seller = User::findOrFail($request->seller_id);
        if (!$seller->isSeller()) {
            return $this->error('Cet utilisateur n\'est pas un vendeur.', 400);
        }

        // Find or create conversation
        $conversation = Conversation::firstOrCreate([
            'buyer_id'   => $user->id,
            'seller_id'  => $request->seller_id,
            'product_id' => $request->product_id,
        ]);

        if ($request->filled('message')) {
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id'       => $user->id,
                'content'         => $request->message,
            ]);
        }

        $conversation->touch();
        $conversation->load(['buyer:id,name', 'seller:id,name', 'product:id,name', 'messages.sender:id,name']);

        return $this->success($conversation, 'Message envoyé', 201);
    }

    /**
     * GET /api/conversations/{id} — Messages d'une conversation
     */
    public function show(Request $request, $id)
    {
        $userId = $request->user()->id;

        $conversation = Conversation::where(function ($q) use ($userId) {
            $q->where('buyer_id', $userId)->orWhere('seller_id', $userId);
        })->with(['buyer:id,name,avatar', 'seller:id,name,avatar', 'product:id,name,image'])->findOrFail($id);

        $messages = $conversation->messages()
            ->with('sender:id,name,avatar')
            ->oldest()
            ->get();

        // Mark messages as read
        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $conversation->messages = $messages;

        return $this->success($conversation, 'Messages de la conversation');
    }

    /**
     * POST /api/conversations/{id}/messages — Envoyer un message
     */
    public function sendMessage(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $userId = $request->user()->id;

        $conversation = Conversation::where(function ($q) use ($userId) {
            $q->where('buyer_id', $userId)->orWhere('seller_id', $userId);
        })->findOrFail($id);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $userId,
            'content'         => $request->content,
        ]);

        $conversation->touch();
        $message->load('sender:id,name');

        return $this->success($message, 'Message envoyé', 201);
    }
}
