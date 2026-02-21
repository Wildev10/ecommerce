<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Statut de commande mis à jour</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; }
        .header { text-align: center; color: #333; }
        .status { display: inline-block; padding: 8px 16px; border-radius: 4px; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Mise à jour de commande 📦</h1>
        <p>Bonjour {{ $order->user->name }},</p>
        <p>Le statut de votre commande <strong>#{{ $order->order_number }}</strong> a été mis à jour :</p>
        <p>
            <span class="status" style="background: #fee2e2; color: #991b1b;">{{ $oldStatus }}</span>
            →
            <span class="status" style="background: #dcfce7; color: #166534;">{{ $newStatus }}</span>
        </p>

        <p><strong>Total :</strong> {{ number_format($order->total, 0, ',', ' ') }} FCFA</p>

        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
