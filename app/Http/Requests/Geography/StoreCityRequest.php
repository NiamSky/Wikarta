<?php

namespace App\Http\Requests\Geography;

use Illuminate\Foundation\Http\FormRequest;

class StoreCityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'province_id' => ['required', 'exists:provinces,id'],
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'in:kota,kabupaten'],
            'code' => ['required', 'string', 'max:10', 'unique:cities,code'],
        ];
    }
}
