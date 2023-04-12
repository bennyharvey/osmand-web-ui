<?php

declare(strict_types=1);

namespace App\DTO;

class LatLng
{
    public function __construct(
        public readonly float $latitude,
        public readonly float $longitude,
    ) {
    }
}
