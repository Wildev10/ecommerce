<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    // Lister mes adresses
    public function index()
    {
        $addresses = auth()->user()->addresses()->orderBy('is_default', 'desc')->get();

        return response()->json($addresses);
    }

    // Créer une adresse
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

        return response()->json([
            'message' => 'Adresse ajoutée avec succès',
            'address' => $address,
        ], 201);
    }

    // Voir une adresse
    public function show(Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($address);
    }

    // Modifier une adresse
    public function update(Request $request, Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
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

        return response()->json([
            'message' => 'Adresse modifiée avec succès',
            'address' => $address,
        ]);
    }

    // Supprimer une adresse
    public function destroy(Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $wasDefault = $address->is_default;
        $address->delete();

        if ($wasDefault) {
            $first = auth()->user()->addresses()->first();
            if ($first) {
                $first->update(['is_default' => true]);
            }
        }

        return response()->json([
            'message' => 'Adresse supprimée avec succès',
        ]);
    }

    // Définir comme défaut
    public function setDefault(Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        auth()->user()->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return response()->json([
            'message' => 'Adresse définie par défaut',
            'address' => $address,
        ]);
    }
}
