<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Kalnoy\Nestedset\NodeTrait;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;


class Category extends Model implements HasMedia
{

   use HasFactory,NodeTrait,InteractsWithMedia;

    protected $guarded = [];
    const PATH='category';

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('category_icons')
        ->acceptsMimeTypes(['image/jpeg','image/png'])
        ->useDisk('media');



        $this->addMediaCollection('category_images')
        ->acceptsMimeTypes(['image/jpeg','image/png'])
        ->useDisk('media');

    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

}
