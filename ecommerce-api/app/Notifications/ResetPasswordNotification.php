<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));

        $url = $frontendUrl . '/reset-password'
            . '?token=' . $this->token
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line('Vous recevez cet email car nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.')
            ->action('Réinitialiser le mot de passe', $url)
            ->line('Ce lien expirera dans ' . config('auth.passwords.users.expire', 60) . ' minutes.')
            ->line('Si vous n\'avez pas demandé de réinitialisation, aucune action n\'est requise.')
            ->salutation('L\'équipe ' . config('app.name'));
    }
}
