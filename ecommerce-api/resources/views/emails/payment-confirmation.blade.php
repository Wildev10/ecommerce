<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Confirmation de paiement</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; }
        .header { text-align: center; color: #333; }
        .amount { font-size: 24px; font-weight: bold; color: #16a34a; text-align: center; margin: 20px 0; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Paiement reçu 💳</h1>
        <p>Bonjour {{ $payment->user->name }},</p>
        <p>Nous avons bien reçu votre paiement pour la commande <strong>#{{ $payment->order->order_number }}</strong>.</p>

        <div class="amount">{{ number_format($payment->amount, 0, ',', ' ') }} FCFA</div>

        <p><strong>Méthode :</strong> {{ $payment->method }}</p>
        <p><strong>Transaction :</strong> {{ $payment->transaction_id }}</p>
        <p><strong>Statut :</strong> {{ $payment->status }}</p>

        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
