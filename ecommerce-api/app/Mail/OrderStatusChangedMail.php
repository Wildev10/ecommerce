<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusChangedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $oldStatus;
    public string $newStatus;

    public function __construct(public Order $order, string $oldStatus, string $newStatus)
    {
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Commande #' . $this->order->order_number . ' — Statut mis à jour',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-status-changed',
        );
    }
}
