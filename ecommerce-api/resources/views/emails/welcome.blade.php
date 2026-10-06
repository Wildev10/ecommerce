<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bienvenue</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; }
        .header { text-align: center; color: #333; }
        .btn { display: inline-block; padding: 12px 24px; background: #4F46E5; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Bienvenue {{ $user->name }} ! 🎉</h1>
        <p>Merci de vous être inscrit sur <strong>{{ config('app.name') }}</strong>.</p>
        <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
        <ul>
            <li>Parcourir notre catalogue de produits</li>
            <li>Ajouter des articles à votre panier</li>
            <li>Passer vos commandes en toute sécurité</li>
        </ul>
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
