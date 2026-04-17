<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOltRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', Rule::unique('olts', 'code')->ignore($this->route('olt'))],
            'brand' => ['nullable', 'string', 'max:50'],
            'model' => ['nullable', 'string', 'max:100'],
            'ip_address' => ['nullable', 'ip'],
            'city_id' => ['nullable', 'exists:cities,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'village_id' => ['nullable', 'exists:villages,id'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'location_description' => ['nullable', 'string', 'max:255'],
            'total_ports' => ['required', 'integer', 'min:1', 'max:256'],
            'status' => ['required', Rule::in(['active', 'inactive', 'maintenance', 'decommissioned'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
