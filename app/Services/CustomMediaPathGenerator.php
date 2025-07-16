<?php

namespace App\Services;


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
           



            default:
                return $media->id . DIRECTORY_SEPARATOR;
        }
    }


}
