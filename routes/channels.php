<?php

use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat-room', function ($user) {
    return auth()->user() ? new UserResource($user) : null;
});