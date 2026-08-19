<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'phone',
        'address',
        'logo',
        'receipt_width',
        'currency',
        'language',
    ];

    protected $casts = [
        'receipt_width' => 'integer',
    ];
}
