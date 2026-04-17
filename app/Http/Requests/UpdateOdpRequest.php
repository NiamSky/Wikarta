<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOdpRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->input('odc_id') === '') {
            $this->merge(['odc_id' => null]);
        }
    }

    public function authorize(): bool
    {
        return $this->user()->isAdmin() || $this->user()->isTechnician();
    }

    public function rules(): array
    {
        return [
            'odc_id' => ['required', 'exists:odcs,id'],
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', Rule::unique('odps', 'code')->ignore($this->route('odp'))],
            'brand' => ['nullable', 'string', 'max:50'],
            'model' => ['nullable', 'string', 'max:100'],
            'city_id' => ['nullable', 'exists:cities,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'village_id' => ['nullable', 'exists:villages,id'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'location_description' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'total_ports' => ['required', 'integer', Rule::in([8, 16, 32])],
            'used_ports' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['active', 'inactive', 'full', 'maintenance', 'damaged', 'decommissioned'])],
            'installation_date' => ['nullable', 'date', 'before_or_equal:today'],
            'last_maintenance_date' => ['nullable', 'date', 'before_or_equal:today'],
            'pole_number' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
