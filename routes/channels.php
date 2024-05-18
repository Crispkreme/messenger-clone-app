<?php

use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('online', function ($user) {
//     return $user;
// });

Broadcast::channel('chat-room', function ($user) {
    return auth()->user();
});