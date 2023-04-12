<?php

declare(strict_types=1);

namespace App\Component;

use JsonException;
use Symfony\Component\HttpFoundation\Request;

class RequestManager
{
    /**
     * @throws JsonException
     */
    public static function getAsArray(Request $request): array
    {
        return json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
    }
}
