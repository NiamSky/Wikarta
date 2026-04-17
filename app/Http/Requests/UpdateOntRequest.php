<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOntRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin() || $this->user()->isTechnician();
    }

    public function rules(): array
    {
        return [
            'odp_id' => ['required', 'exists:odps,id'],
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', Rule::unique('onts', 'code')->ignore($this->route('ont'))],
            'serial_number' => ['nullable', 'string', 'max:100', Rule::unique('onts', 'serial_number')->ignore($this->route('ont'))],
            'customer_name' => ['nullable', 'string', 'max:150'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'status' => ['required', Rule::in(['active', 'inactive', 'maintenance', 'decommissioned'])],
            'installed_at' => ['nullable', 'date', 'before_or_equal:today'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
