<?php

namespace App\Http\Requests\Dashboard\Auth;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

            return [
            'password' => 'required|string|min:8',
            'email' => 'nullable|email|max:255|required_without:phone',
            'phone' => 'nullable|string|regex:/^01[0-9]{9}$/|required_without:email',
        ];

    }

    public function messages(): array
    {
        return [
            'password.required' => 'كلمة المرور مطلوبة',
            'password.min' => 'يجب أن تحتوي كلمة المرور على الأقل على 8 أحرف',
            'email.email' => 'يجب أن يكون البريد الإلكتروني صالحًا',
            'phone.regex' => 'يجب أن يبدأ رقم الهاتف بـ 01 ويتكون من 11 رقمًا',
            'required_without' => 'يجب تقديم إما البريد الإلكتروني أو رقم الهاتف',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation errors',
            'errors' => $validator->errors()
        ], 422));
    }

}
