<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * POST /api/register — Inscription
     * Accès : Public | Rate limit: 5/min
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role'     => ['sometimes', 'in:buyer,seller'],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role ?? 'buyer',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user'  => $user,
            'token' => $token,
        ], 'Inscription réussie', 201);
    }

    /**
     * POST /api/login — Connexion
     * Accès : Public | Rate limit: 5/min
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return $this->error('Email ou mot de passe incorrect', 401);
        }

        $user = Auth::user();

        if (!$user->is_active) {
            Auth::guard('web')->logout();
            return $this->error('Votre compte est désactivé', 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user'  => $user,
            'token' => $token,
        ], 'Connexion réussie');
    }

    /**
     * POST /api/logout — Déconnexion
     * Accès : Authentifié
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Déconnexion réussie');
    }

    /**
     * POST /api/auth/refresh — Renouveler le token
     * Accès : Authentifié
     */
    public function refresh(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'token' => $token,
        ], 'Token renouvelé');
    }

    /**
     * GET /api/user — Profil utilisateur
     * Accès : Authentifié
     */
    public function profile(Request $request)
    {
        return $this->success([
            'user' => $request->user()->load('addresses'),
        ], 'Profil utilisateur');
    }

    /**
     * PUT /api/user/update — Mettre à jour le profil
     * Accès : Authentifié
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name'    => ['sometimes', 'string', 'max:255'],
            'phone'   => ['sometimes', 'string', 'max:20'],
            'address' => ['sometimes', 'string'],
            'avatar'  => ['sometimes', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $user = $request->user();
        $data = $request->only('name', 'phone', 'address');

        // Upload avatar
        if ($request->hasFile('avatar')) {
            if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return $this->success([
            'user' => $user->fresh(),
        ], 'Profil mis à jour');
    }

    /**
     * PUT /api/user/password — Changer le mot de passe
     * Accès : Authentifié
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->error('Le mot de passe actuel est incorrect', 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return $this->success(null, 'Mot de passe modifié avec succès');
    }

    /**
     * POST /api/auth/forgot-password — Demande de réinitialisation
     * Accès : Public
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return $this->success(null, 'Lien de réinitialisation envoyé par email');
        }

        return $this->error('Impossible d\'envoyer le lien de réinitialisation', 400);
    }

    /**
     * POST /api/auth/reset-password — Réinitialiser le mot de passe
     * Accès : Public (avec token)
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => ['required'],
            'email'    => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->success(null, 'Mot de passe réinitialisé avec succès');
        }

        return $this->error('Token invalide ou expiré', 400);
    }
}
