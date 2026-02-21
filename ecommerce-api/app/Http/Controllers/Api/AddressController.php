<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/addresses — Lister mes adresses
     * Accès : Authentifié
     */
    public function index()
    {
        $addresses = auth()->user()->addresses()->orderBy('is_default', 'desc')->get();

        return $this->success($addresses, 'Liste des adresses');
    }

    /**
     * POST /api/addresses — Créer une adresse
     * Accès : Authentifié
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'label'          => 'sometimes|string|max:50',
            'full_name'      => 'required|string|max:255',
            'phone'          => 'required|string|max:20',
            'city'           => 'required|string|max:100',
            'quarter'        => 'required|string|max:100',
            'street_address' => 'required|string',
            'landmark'       => 'nullable|string',
            'is_default'     => 'sometimes|boolean',
        ]);

        $count = auth()->user()->addresses()->count();
        if ($count === 0) {
            $validated['is_default'] = true;
        }

        if (!empty($validated['is_default']) && $validated['is_default']) {
            auth()->user()->addresses()->update(['is_default' => false]);
        }

        $validated['user_id'] = auth()->id();
        $address = Address::create($validated);

        return $this->success($address, 'Adresse ajoutée avec succès', 201);
    }

    /**
     * GET /api/addresses/{address} — Voir une adresse
     * Accès : Authentifié (propriétaire)
     */
    public function show(Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            return $this->error('Non autorisé', 403);
        }

        return $this->success($address, 'Détail de l\'adresse');
    }

    /**
     * PUT /api/addresses/{address} — Modifier une adresse
     * Accès : Authentifié (propriétaire)
     */
    public function update(Request $request, Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            return $this->error('Non autorisé', 403);
        }

        $validated = $request->validate([
            'label'          => 'sometimes|string|max:50',
            'full_name'      => 'sometimes|string|max:255',
            'phone'          => 'sometimes|string|max:20',
            'city'           => 'sometimes|string|max:100',
            'quarter'        => 'sometimes|string|max:100',
            'street_address' => 'sometimes|string',
            'landmark'       => 'nullable|string',
            'is_default'     => 'sometimes|boolean',
        ]);

        if (!empty($validated['is_default']) && $validated['is_default']) {
            auth()->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return $this->success($address, 'Adresse modifiée avec succès');
    }

    /**
     * DELETE /api/addresses/{address} — Supprimer une adresse
     * Accès : Authentifié (propriétaire)
     */
    public function destroy(Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            return $this->error('Non autorisé', 403);
        }

        if ($address->orders()->exists()) {
            return $this->error('Cette adresse est liée à des commandes et ne peut pas être supprimée', 409);
        }

        $wasDefault = $address->is_default;
        $address->delete();

        if ($wasDefault) {
            $first = auth()->user()->addresses()->first();
            if ($first) {
                $first->update(['is_default' => true]);
            }
        }

        return $this->success(null, 'Adresse supprimée avec succès');
    }

    /**
     * PATCH /api/addresses/{address}/default — Définir comme adresse par défaut
     * Accès : Authentifié (propriétaire)
     */
    public function setDefault(Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            return $this->error('Non autorisé', 403);
        }

        auth()->user()->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return $this->success($address, 'Adresse définie par défaut');
    }
}
