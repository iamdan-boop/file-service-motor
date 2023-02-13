# file-service-motor

# PHP Backend Sample Service

```php
<?php

use GuzzleHttp\Client;
use Illuminate\Http\Response;
use Psr\Http\Message\ResponseInterface;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;



/**
 * getting file should be in browser level using the file service url https://service.port/fileId in the database
 * should return file stream into the host.
 * for security reason s3 is not publicly available so the express service will send the stream over
 */
class FileService
{
    public Client $client;

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => 'http://localhost:8000',
            'timeout'  => 2.0,
        ]);
    }

    public function allFiles(int $page, int $limit): array
    {
        $files = $this->client->get('/upload');
        if ($files->getStatusCode() !== Response::HTTP_OK) {
            /** return empty array as for the third party issue to not interrupt the whole server*/
            return [];
        }
        return (array) $files->getBody()->getContents();
    }


    /**
     * @param $files list of files to be uploaded to server
     * @return void
     */
    public function store(array $files): void
    {
        $promise = $this->client->postAsync('/upload', [
            'multipart' => [
                'files' => $files
            ]
        ]);

        /** */

        $promise->then(
            function (ResponseInterface $res) {
                $responseBody = $res->getBody();
                /** do something with response body */
            },
            function (RequestException $e) {
                /** handle exceptions */
            }
        );
    }

    /**
     * @param $imageId image id returned back in callback url after the upload succeeded
     * for security reason s3 is not publicly available so the express service will send the stream over
     * @return void
     */
    public function destroy(string $imageId): void
    {
        $deleteImage = $this->client->delete('/upload/' . $imageId);
        if ($deleteImage->getStatusCode() == Response::HTTP_NOT_FOUND) {
            /** handle not found exception either image is not found already deleted */
            return;
        }

        if ($deleteImage->getStatusCode() == Response::HTTP_SERVICE_UNAVAILABLE) {
            /** service unavailable server issue or third party */
            return;
        }
    }
}
```
