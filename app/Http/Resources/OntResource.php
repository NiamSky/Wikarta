<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OntResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $usedPorts = $this->status === 'active' ? 1 : 0;

        return [
            'id' => $this->id,
            'odp_id' => $this->odp_id,
            'name' => $this->name,
            'code' => $this->code,
            'serial_number' => $this->serial_number,
            'customer_name' => $this->customer_name,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
            'total_ports' => 1,
            'used_ports' => $usedPorts,
            'available_ports' => 1 - $usedPorts,
            'capacity_percentage' => $usedPorts * 100,
            'status' => $this->status,
            'installed_at' => $this->installed_at?->toDateString(),
            'notes' => $this->notes,
            'odp' => $this->whenLoaded('odp', fn () => $this->odp ? [
                'id' => $this->odp->id,
                'name' => $this->odp->name,
                'code' => $this->odp->code,
                'latitude' => $this->odp->latitude !== null ? (float) $this->odp->latitude : null,
                'longitude' => $this->odp->longitude !== null ? (float) $this->odp->longitude : null,
            ] : null),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
