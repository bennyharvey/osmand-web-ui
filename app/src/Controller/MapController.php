<?php

namespace App\Controller;

use App\Component\RequestManager;
use App\DTO\LatLng;
use App\Service\GPXService;
use JsonException;
use phpGPX\Models\Extensions;
use phpGPX\Models\Point;
use phpGPX\phpGPX;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

#[AsController]
final class MapController extends AbstractController
{
    public function __construct(
        private readonly ParameterBagInterface $params,
        private readonly CacheInterface        $cache,
        private readonly GPXService $service
    ) {
    }

    #[Route('/home', name: 'homepage', methods: ['POST', 'GET'])]
    public function homepage(Request $request): Response {
        return $this->render('layout.html.twig', []);
    }

    #[Route('/point', name: 'deletePoint', methods: ['DELETE'])]
    public function deletePoint(Request $request): Response {
        try {
            $content = RequestManager::getAsArray($request);
            $point = new LatLng($content['latitude'], $content['longitude']);
            $this->service->deletePoint($content['track'], $point);
        } catch (\DOMException|JsonException $e) {
            return $this->json([
                'error' => $e->getMessage()
            ], 400);
        }
        return new Response(null, 204);
    }



    #[Route('/map', name: 'map', methods: ['GET'])]
    public function map(): Response
    {
        $gpxDir = $this->params->get('kernel.project_dir') . '/var/gpx-tmp';
        $tracksDir = $gpxDir . '/tracks/rec';
        $zip = new \ZipArchive;
        $code = $zip->open($this->params->get('kernel.project_dir') . '/var/Export_10-04-23.osf');
        if ($code === true) {
            $zip->extractTo($gpxDir);
            $zip->close();
        } else {
           throw new \RuntimeException('zip archive error, code: ' . $code);
        }

        $geoData = [];
        $finder = new Finder();
        $finder->files()->in($tracksDir);
        if (!$finder->hasResults()) {
            throw new \RuntimeException('no tracks found in' . $tracksDir);
        }
        $finder->sortByName();
        foreach ($finder as $file) {
            $geoData['files'][] = $this->getFile($file->getRealPath());
        }
        return $this->render('map.html.twig', [
            'geoData' => $geoData
        ]);
    }

    /**
     * @throws InvalidArgumentException
     */
    private function getFile(string $path): array
    {
        return $this->cache->get(basename($path), function (ItemInterface $item) use ($path) {
            $item->expiresAfter(60);
            return phpGPX::load($path)->toArray();
        });
    }
}
