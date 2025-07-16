<?php

namespace App\Services;


use App\Models\Product;
use App\Models\Category;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

/**
 * Class CustomPathGenerator
 * @package App\MediaLibrary
 */
class CustomMediaPathGenerator extends DefaultPathGenerator
{
    /**
     * @param Media $media
     *
     * @return string
     */
    public function getPath(Media $media): string
    {
        switch ($media->model_type) {

          case Category::class:
                return Category::PATH.DIRECTORY_SEPARATOR.$media->collection_name.DIRECTORY_SEPARATOR.$media->id.DIRECTORY_SEPARATOR;
                break;
            case Product::class:
                return Product::PATH.DIRECTORY_SEPARATOR.$media->collection_name.DIRECTORY_SEPARATOR.$media->id.DIRECTORY_SEPARATOR;
                break;


            default:
                return $media->id . DIRECTORY_SEPARATOR;
        }
    }


}
