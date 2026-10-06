<?php

namespace App\Traits;

trait ApiResponse
{
    /**
     * Réponse JSON réussie — format uniforme
     */
    protected function success($data = null, string $message = 'OK', int $code = 200, array $meta = [])
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ];

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    /**
     * Réponse JSON paginée — extrait automatiquement la meta de pagination
     */
    protected function paginated($paginator, string $message = 'OK', int $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $paginator->items(),
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
        ], $code);
    }

    /**
     * Réponse JSON d'erreur — format uniforme
     */
    protected function error(string $message = 'Erreur', int $code = 400, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message,
            'code'    => $code,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Réponse JSON de création — 201
     */
    protected function created($data = null, string $message = 'Créé avec succès')
    {
        return $this->success($data, $message, 201);
    }

    /**
     * Réponse JSON de suppression — 200

     */
    protected function noContent(string $message = 'Supprimé avec succès')
    {
        return $this->success(null, $message);
    }
}
