<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model
{
    use HasFactory,InteractsWithMedia;
    protected $guarded=[];
    const PATH='product';

    public function registerMediaCollections(): void
    {

        $this->addMediaCollection('product_images')
        ->acceptsMimeTypes(['image/jpeg','image/png'])
        ->useDisk('media');

    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
