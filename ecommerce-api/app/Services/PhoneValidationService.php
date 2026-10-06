<?php

namespace App\Services;

class PhoneValidationService
{
    /**
     * Préfixes officiels ARCEP Bénin par opérateur
     */
    private const MTN_PREFIXES = [
        '42', '46', '50', '51', '52', '53', '54', '56', '57', '59',
        '61', '62', '66', '67', '69', '90', '91', '96', '97',
    ];

    private const MOOV_PREFIXES = [
        '45', '55', '58', '60', '63', '64', '65', '68',
        '94', '95', '98', '99',
    ];

    private const CELTIIS_PREFIXES = [
        '20', '21', '22', '23', '24', '28', '29',
        '40', '41', '43', '44', '47', '48', '49',
        '92', '93',
    ];

    /**
     * Numéros marchands du site
     */
    public const MERCHANT_MTN = '61790766';
    public const MERCHANT_MOOV = '60590500';

    /**
     * Normalise un numéro de téléphone béninois en 8 chiffres.
     *
     * Formats acceptés :
     *  - 97000000           (8 chiffres)
     *  - 0197000000         (10 chiffres, préfixe 01)
     *  - +2290197000000     (indicatif +229 + 10 chiffres)
     *  - 2290197000000      (indicatif 229 + 10 chiffres)
     *  - +22997000000       (indicatif +229 + 8 chiffres)
     *  - 22997000000        (indicatif 229 + 8 chiffres)
     */
    public function normalize(string $phone): string
    {
        // Retirer espaces, tirets, points, parenthèses
        $phone = preg_replace('/[\s\-\.\(\)]+/', '', $phone);

        // Retirer le + initial
        $phone = ltrim($phone, '+');

        // Retirer l'indicatif pays 229
        if (str_starts_with($phone, '229')) {
            $phone = substr($phone, 3);
        }

        // Retirer le préfixe 01 (nouvelle numérotation 10 chiffres)
        if (strlen($phone) === 10 && str_starts_with($phone, '01')) {
            $phone = substr($phone, 2);
        }

        return $phone;
    }

    /**
     * Détecte l'opérateur d'un numéro béninois.
     *
     * @return array{valid: bool, operator: string|null, phone: string, message: string}
     */
    public function detectOperator(string $phone): array
    {
        $normalized = $this->normalize($phone);

        // Vérifier que le résultat est bien 8 chiffres numériques
        if (!preg_match('/^\d{8}$/', $normalized)) {
            return [
                'valid'    => false,
                'operator' => null,
                'phone'    => $normalized,
                'message'  => 'Le numéro doit contenir 8 chiffres (format béninois).',
            ];
        }

        $prefix = substr($normalized, 0, 2);

        if (in_array($prefix, self::MTN_PREFIXES, true)) {
            return [
                'valid'    => true,
                'operator' => 'MTN',
                'phone'    => $normalized,
                'message'  => 'Numéro MTN Bénin valide.',
            ];
        }

        if (in_array($prefix, self::MOOV_PREFIXES, true)) {
            return [
                'valid'    => true,
                'operator' => 'MOOV',
                'phone'    => $normalized,
                'message'  => 'Numéro Moov Africa Bénin valide.',
            ];
        }

        if (in_array($prefix, self::CELTIIS_PREFIXES, true)) {
            return [
                'valid'    => true,
                'operator' => 'CELTIIS',
                'phone'    => $normalized,
                'message'  => 'Numéro Celtiis Bénin valide.',
            ];
        }

        return [
            'valid'    => false,
            'operator' => null,
            'phone'    => $normalized,
            'message'  => 'Numéro invalide : le préfixe « ' . $prefix . ' » ne correspond à aucun opérateur béninois.',
        ];
    }

    /**
     * Vérifie que le numéro correspond à l'opérateur attendu pour le mode de paiement.
     *
     * @return array{valid: bool, operator: string|null, phone: string, message: string}
     */
    public function validateForPayment(string $phone, string $paymentMethod): array
    {
        $result = $this->detectOperator($phone);

        if (!$result['valid']) {
            return $result;
        }

        $expectedOperator = match ($paymentMethod) {
            'mtn_momo'     => 'MTN',
            'moov_money'   => 'MOOV',
            'mobile_money' => null, // Accepte MTN ou MOOV
            default        => null,
        };

        if ($expectedOperator !== null && $result['operator'] !== $expectedOperator) {
            return [
                'valid'    => false,
                'operator' => $result['operator'],
                'phone'    => $result['phone'],
                'message'  => "Ce numéro est un numéro {$result['operator']}, mais vous avez choisi le paiement {$expectedOperator}.",
            ];
        }

        // Pour mobile_money générique, rejeter Celtiis (pas de mobile money)
        if ($paymentMethod === 'mobile_money' && $result['operator'] === 'CELTIIS') {
            return [
                'valid'    => false,
                'operator' => $result['operator'],
                'phone'    => $result['phone'],
                'message'  => 'Celtiis ne propose pas de service Mobile Money. Veuillez utiliser un numéro MTN ou Moov.',
            ];
        }

        return $result;
    }
}
