<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Services\PhoneValidationService;

class PhoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => 'required|in:credit_card,paypal,bank_transfer,cash_on_delivery,mobile_money,mtn_momo,moov_money',
            'phone_number'   => [
                'required_if:payment_method,mobile_money,mtn_momo,moov_money',
                'nullable',
                'string',
                'max:20',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (empty($value)) {
                        return;
                    }

                    $method = $this->input('payment_method');

                    if (!in_array($method, ['mobile_money', 'mtn_momo', 'moov_money'])) {
                        return;
                    }

                    $service = app(PhoneValidationService::class);
                    $result = $service->validateForPayment($value, $method);

                    if (!$result['valid']) {
                        $fail($result['message']);
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'payment_method.required' => 'Le mode de paiement est requis.',
            'payment_method.in'       => 'Mode de paiement non supporté.',
            'phone_number.required_if' => 'Le numéro de téléphone est requis pour le paiement Mobile Money.',
            'phone_number.max'        => 'Le numéro de téléphone est trop long.',
        ];
    }
}
