<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OdpResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'odc_id' => $this->odc_id,
            'olt_id' => $this->olt_id,
            'name' => $this->name,
            'code' => $this->code,
            'brand' => $this->brand,
            'model' => $this->model,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
            'location_description' => $this->location_description,
            'address' => $this->address,
            'total_ports' => $this->total_ports,
            'used_ports' => $this->used_ports,
            'available_ports' => $this->available_ports,
            'capacity_percentage' => $this->capacity_percentage,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'installation_date' => $this->installation_date?->toDateString(),
            'last_maintenance_date' => $this->last_maintenance_date?->toDateString(),
            'pole_number' => $this->pole_number,
            'notes' => $this->notes,
            'odc' => $this->whenLoaded('odc', fn () => $this->odc ? [
                'id' => $this->odc->id,
                'name' => $this->odc->name,
                'code' => $this->odc->code,
                'latitude' => $this->odc->latitude !== null ? (float) $this->odc->latitude : null,
                'longitude' => $this->odc->longitude !== null ? (float) $this->odc->longitude : null,
            ] : null),
            'olt' => $this->whenLoaded('olt', fn () => $this->olt ? [
                'id' => $this->olt->id,
                'name' => $this->olt->name,
                'code' => $this->olt->code,
                'latitude' => $this->olt->latitude !== null ? (float) $this->olt->latitude : null,
                'longitude' => $this->olt->longitude !== null ? (float) $this->olt->longitude : null,
            ] : null),
            'city' => $this->whenLoaded('city', fn () => $this->city ? ['id' => $this->city->id, 'name' => $this->city->name] : null),
            'district' => $this->whenLoaded('district', fn () => $this->district ? ['id' => $this->district->id, 'name' => $this->district->name] : null),
            'village' => $this->whenLoaded('village', fn () => $this->village ? ['id' => $this->village->id, 'name' => $this->village->name] : null),
            'onts' => $this->whenLoaded('onts', fn () => $this->onts->map(fn ($ont) => [
                'id' => $ont->id,
                'name' => $ont->name,
                'code' => $ont->code,
                'status' => $ont->status,
                'serial_number' => $ont->serial_number,
                'customer_name' => $ont->customer_name,
                'latitude' => $ont->latitude !== null ? (float) $ont->latitude : null,
                'longitude' => $ont->longitude !== null ? (float) $ont->longitude : null,
            ])),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
