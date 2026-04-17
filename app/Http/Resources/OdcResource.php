<?php

namespace App\Http\Resources;

use App\Models\Odp;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OdcResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $usedPorts = $this->resolveUsedPorts();
        $availablePorts = max((int) $this->total_ports - $usedPorts, 0);
        $capacityPercentage = (int) ($this->total_ports > 0
            ? round(($usedPorts / $this->total_ports) * 100)
            : 0);

        return [
            'id' => $this->id,
            'olt_id' => $this->olt_id,
            'name' => $this->name,
            'code' => $this->code,
            'brand' => $this->brand,
            'model' => $this->model,
            'latitude' => $this->latitude ? (float) $this->latitude : null,
            'longitude' => $this->longitude ? (float) $this->longitude : null,
            'location_description' => $this->location_description,
            'address' => $this->address,
            'total_ports' => $this->total_ports,
            'used_ports' => $usedPorts,
            'available_ports' => $availablePorts,
            'capacity_percentage' => $capacityPercentage,
            'status' => $this->status,
            'installation_date' => $this->installation_date?->toDateString(),
            'notes' => $this->notes,
            'olt' => $this->whenLoaded('olt', fn () => [
                'id' => $this->olt->id,
                'name' => $this->olt->name,
                'code' => $this->olt->code,
                'latitude' => $this->olt->latitude !== null ? (float) $this->olt->latitude : null,
                'longitude' => $this->olt->longitude !== null ? (float) $this->olt->longitude : null,
            ]),
            'city' => $this->whenLoaded('city', fn () => ['id' => $this->city->id, 'name' => $this->city->name]),
            'district' => $this->whenLoaded('district', fn () => $this->district ? ['id' => $this->district->id, 'name' => $this->district->name] : null),
            'village' => $this->whenLoaded('village', fn () => $this->village ? ['id' => $this->village->id, 'name' => $this->village->name] : null),
            'odps' => $this->whenLoaded('odps', fn () => $this->odps->map(fn ($odp) => [
                'id' => $odp->id,
                'name' => $odp->name,
                'code' => $odp->code,
                'status' => $odp->status,
                'total_ports' => $odp->total_ports,
                'used_ports' => $odp->used_ports,
                'available_ports' => $odp->available_ports,
                'capacity_percentage' => $odp->capacity_percentage,
                'pole_number' => $odp->pole_number,
            ])),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }

    private function resolveUsedPorts(): int
    {
        if (isset($this->connected_odps_count)) {
            return (int) $this->connected_odps_count;
        }

        if (isset($this->odps_count)) {
            return (int) $this->odps_count;
        }

        if ($this->relationLoaded('odps')) {
            return $this->odps->count();
        }

        return Odp::query()
            ->where('odc_id', $this->id)
            ->count();
    }
}
