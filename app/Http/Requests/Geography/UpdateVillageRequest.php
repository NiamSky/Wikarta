<?php

namespace App\Http\Requests\Geography;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVillageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'district_id' => ['required', 'exists:districts,id'],
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'in:kelurahan,desa'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'code' => ['required', 'string', 'max:20', Rule::unique('villages', 'code')->ignore($this->route('village'))],
        ];
    }
}
