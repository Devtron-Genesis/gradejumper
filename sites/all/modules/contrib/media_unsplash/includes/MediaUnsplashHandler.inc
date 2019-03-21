<?php

/**
 * @file
 * Definition of MediaUnsplashHandler.
 */

/**
 * A class for managing the addition of Internet files.
 */
class MediaUnsplashHandler extends MediaInternetBaseHandler {

  /**
   * File object.
   *
   * @var \stdClass
   */
  public $fileObject;

  /**
   * Prepare file object.
   *
   * @param object $file_obj
   *   File object upon manipulation is done.
   *
   * @throws \Exception
   */
  public function preSave(&$file_obj) {
    // Copy the remote file locally.
    $remote_uri = $file_obj->uri;

    // Check mimetype - Unsplash images are without extension.
    $image_data = $this->imageInfo($file_obj->uri);
    $file_obj->filemime = $image_data->filemime;
    $file_obj->filename = $image_data->filename;

    $local_uri = file_stream_wrapper_uri_normalize('temporary://' . $image_data->filename);
    if (!@copy($remote_uri, $local_uri)) {
      throw new Exception('Unable to add file ' . $remote_uri);
    }

    $file_obj = file_uri_to_object($local_uri);
  }

  /**
   * Saving file.
   *
   * @param object $file_obj
   *   File object upon manipulation is done.
   */
  public function postSave(&$file_obj) {
    $scheme = variable_get('file_default_scheme', 'public') . '://';
    module_load_include('inc', 'file_entity', 'file_entity.pages');
    $destination_uri = file_entity_upload_destination_uri(array());
    $uri = file_stream_wrapper_uri_normalize($destination_uri . '/' . $file_obj->filename);

    // Now to its new home.
    $file_obj = file_move($file_obj, $uri, FILE_EXISTS_RENAME);
  }

  /**
   * Create file.
   *
   * @return bool|object
   *   Return file object.
   */
  public function getFileObject() {
    if (!$this->fileObject) {
      $this->fileObject = file_uri_to_object($this->embedCode);
    }
    return $this->fileObject;
  }

  /**
   * Verify link.
   *
   * @param string $embedCode
   *   URL which needs to be validated.
   *
   * @return bool
   *   Return TRUE or FALSE.
   */
  public function claim($embedCode) {

    // Claim only valid URLs from unsplash.
    if (!empty($embedCode)) {
      $host = @parse_url($embedCode, PHP_URL_HOST);
      if ($host == 'unsplash.com') {
        return TRUE;
      }
    }

    return FALSE;
  }

  /**
   * Function to parse remote url to retrieve extension.
   *
   * @param string $uri
   *   URL of remote file.
   *
   * @return \stdClass
   *   Image date returned (type, extension).
   */
  public function imageInfo($uri) {

    $image_data = new stdClass();

    // Get filename.
    $parse_url = parse_url($uri);
    $name = str_replace('/', '', $parse_url['path']);
    $image_data->filename = $name;

    // Define defaults in case URL changes.
    $image_data->extension = 'jpg';
    $image_data->filemime = 'image/jpeg';

    // Split URL by parameter for image type - fm.
    $parse = explode('&fm=', $uri);

    if (isset($parse[1])) {
      $split = explode('&', $parse[1]);
      $image_data->extension = $split[0];

      if ($split[0] == 'jpg') {
        $split[0] = 'jpeg';
      }

      $image_data->filemime = 'image/' . $split[0];
      $image_data->filename = $image_data->filename . '.' . $image_data->extension;
    }

    return $image_data;
  }

}
