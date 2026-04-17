<?php

namespace App\Http\Resources;

use App\Models\Odc;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OltResource extends JsonResource
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
            'name' => $this->name,
            'code' => $this->code,
            'brand' => $this->brand,
            'model' => $this->model,
            'ip_address' => $this->ip_address,
            'latitude' => $this->latitude ? (float) $this->latitude : null,
            'longitude' => $this->longitude ? (float) $this->longitude : null,
            'location_description' => $this->location_description,
            'total_ports' => $this->total_ports,
            'used_ports' => $usedPorts,
            'available_ports' => $availablePorts,
            'capacity_percentage' => $capacityPercentage,
            'status' => $this->status,
            'notes' => $this->notes,
            'city' => $this->whenLoaded('city', fn () => ['id' => $this->city->id, 'name' => $this->city->name]),
            'district' => $this->whenLoaded('district', fn () => $this->district ? ['id' => $this->district->id, 'name' => $this->district->name] : null),
            'village' => $this->whenLoaded('village', fn () => $this->village ? ['id' => $this->village->id, 'name' => $this->village->name] : null),
            'odcs' => $this->whenLoaded('odcs', fn () => $this->odcs->map(fn ($odc) => [
                'id' => $odc->id,
                'name' => $odc->name,
                'code' => $odc->code,
                'status' => $odc->status,
                'total_ports' => $odc->total_ports,
                'used_ports' => ($odc->connected_odps_count ?? $odc->odps_count ?? $odc->used_ports),
                'capacity_percentage' => $odc->total_ports > 0
                    ? (int) round((($odc->connected_odps_count ?? $odc->odps_count ?? $odc->used_ports) / $odc->total_ports) * 100)
                    : 0,
                'odps_count' => ($odc->connected_odps_count ?? $odc->odps_count ?? 0),
            ])),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }

    private function resolveUsedPorts(): int
    {
        return $this->resolveConnectedOdcsCount();
    }

    private function resolveConnectedOdcsCount(): int
    {
        if (isset($this->connected_odcs_count)) {
            return (int) $this->connected_odcs_count;
        }

        if ($this->relationLoaded('odcs')) {
            return $this->odcs->count();
        }

        return Odc::query()
            ->where('olt_id', $this->id)
            ->count();
    }
}
