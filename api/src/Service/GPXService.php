<?php

declare(strict_types=1);

namespace App\Service;

use App\DTO\LatLng;
use DOMDocument;
use DOMException;
use phpGPX\Models\GpxFile;
use phpGPX\Models\Point;
use phpGPX\Models\Segment;
use phpGPX\Models\Track;
use phpGPX\Parsers\ExtensionParser;
use phpGPX\Parsers\MetadataParser;
use phpGPX\Parsers\PointParser;
use phpGPX\Parsers\RouteParser;
use phpGPX\Parsers\TrackParser;
use phpGPX\phpGPX;

class GPXService
{
    public function __construct(
        private readonly string $tracksDir,
        private readonly string $backupsDir,
    ) {
    }

    /**
     * @throws DOMException
     */
    public function deletePoint(string $trackName, LatLng $coords): GpxFile
    {
        $path = "$this->tracksDir/$trackName.gpx";
        $file = phpGPX::load($path);
        $date = date('YmdHis');
        $file->save("$this->backupsDir/$trackName.backup.$date.gpx", phpGPX::XML_FORMAT);
        $newFile = new GpxFile();
        $newFile->metadata = $file->metadata;
        $newFile->creator = $file->creator;
        $newFile->extensions = $file->extensions;
        foreach ($file->tracks as $track) {
            $newSegments = [];
            foreach ($track->segments as $segment) {
                $newPoints = [];
                foreach ($segment->points as $point) {
                    if (
                        ($point->latitude === $coords->latitude)
                        && ($point->longitude === $coords->longitude)
                    ) {
                        continue;
                    }
                    $newPoints[] = $point;
                }
                $newSegment = new Segment();
                $newSegment->points = $newPoints;
                $newSegment->extensions = $segment->extensions;
                $newSegment->stats = $segment->stats;
                $newSegment->recalculateStats();
                $newSegments[] = $newSegment;
            }
            $newTrack = new Track();
            $newTrack->segments = $newSegments;
            $newTrack->extensions = $track->extensions;
            $newTrack->stats = $track->stats;
            $newTrack->recalculateStats();
            $newFile->tracks[] = $newTrack;
        }

        $xml = $this->toXML($newFile);
        $xml->save($path);
        return $newFile;
    }

    /**
     * @throws DOMException
     */
    public function toXML(GpxFile $file): DOMDocument
    {
        $document = new DOMDocument("1.0", 'UTF-8');
        $document->xmlStandalone = true;

        $gpx = $document->createElementNS("http://www.topografix.com/GPX/1/1", "gpx");
        $gpx->setAttribute("version", "1.1");
        $gpx->setAttribute("xmlns:osmand", "https://osmand.net");
        $gpx->setAttribute("creator", $file->creator ?: phpGPX::getSignature());

        if (!empty($file->metadata)) {
            $gpx->appendChild(MetadataParser::toXML($file->metadata, $document));
        }

        foreach ($file->waypoints as $waypoint) {
            $gpx->appendChild(PointParser::toXML($waypoint, $document));
        }

        foreach ($file->routes as $route) {
            $gpx->appendChild(RouteParser::toXML($route, $document));
        }

        foreach ($file->tracks as $track) {
            $gpx->appendChild(TrackParser::toXML($track, $document));
        }

        if (!empty($file->extensions)) {
            $gpx->appendChild(ExtensionParser::toXML($file->extensions, $document));
        }

        $schemaLocationArray = [
            'http://www.topografix.com/GPX/1/1',
            'http://www.topografix.com/GPX/1/1/gpx.xsd'
        ];

        $gpx->setAttributeNS(
            'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation',
            implode(" ", $schemaLocationArray)
        );

        $document->appendChild($gpx);

        if (phpGPX::$PRETTY_PRINT) {
            $document->formatOutput = true;
            $document->preserveWhiteSpace = true;
        }
        return $document;
    }
}
