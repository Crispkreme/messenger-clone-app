<?php

namespace App\Http\Controllers;

use App\Events\SocketMessage;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Group;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\MassageResource;
use App\Models\Conversation;
use App\Models\MessageAttachment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Socket;

class MessageController extends Controller
{
    public function byUser(User $user) {
        $messages = Message::where('sender_id', auth()->id())
            ->where('reciever_id', $user->id)
            ->orWhere('sender_id', $user->id)
            ->where('reciever_id', auth()->id())
            ->latest()
            ->paginate(10);

        return inertia('Home', [
            'selectedConversation' => $user->toConversationArray(),
            'messages' => MassageResource::collection($messages),
        ]);
    }

    public function byGroup(Group $group) {
        $messages = Message::where('group_id', auth()->id())
            ->latest()
            ->paginate(10);

        return inertia('Home', [
            'selectedConversation' => $group->toConversationArray(),
            'messages' => MassageResource::collection($messages),
        ]);
    }

    public function loadOlder(Message $message) {
        
        if($message->group_id) {
            $messages = Message::where('created_at', '<', $message->created_at)
                ->where('group_id', $message->group_id)
                ->latest()
                ->paginate(10);

        } else {

            $messages = Message::where('created_at', '<', $message->created_at)
                ->where(function($query) use($message) {
                    $query->where('sender_id', $message->sender_id)
                          ->where('reciever_id', $message->reciever_id)
                          ->orWhere('sender_id', $message->reciever_id)
                          ->where('reciever_id', $message->sender_id);
                })
                ->latest()
                ->paginate(10);
        }

        return MassageResource::collection($messages);
    }

    public function store(StoreMessageRequest $request) {

        $data = $request->validated();
        $data['sender_id'] = auth()->id();
        $recieverId = $data['reciever_id'] ?? null;
        $groupId = $data['group_id'] ?? null;
        $files = $data['attachments'] ?? [];

        $message = Message::create($data);
        $attachments = [];

        if($files) {

            foreach($files as $file) {
                $directory = 'attachment/' . Str::random(32);
                Storage::makeDirectory($directory);

                $model = [
                    'message_id' => $message->id,
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize,
                    'path' => $file->store($directory, 'public'),
                ];
                $attachment = MessageAttachment::create($model);
                $attachments[] = $attachment;
            }

            $message->attachments = $attachments;
        }

        if($recieverId) {
            Conversation::updateConversationWithMessage($recieverId, auth()->id(), $message);
        }

        if($groupId) {
            Conversation::updateGroupWithMessage($recieverId, auth()->id(), $message);
        }

        SocketMessage::dispatch($message);

        return new MassageResource($message);
    }

    public function destroy(Message $message) {
        if($message->sender_id !== auth()->id()) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $message->delete();
        return response('', 204);
    }
}
