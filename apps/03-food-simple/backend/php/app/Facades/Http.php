<?php

namespace App\Facades;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class Http
{
    private static $client;
    private $headers = [];
    private $baseUrl = '';

    private static function getClient()
    {
        if (!self::$client) {
            self::$client = new Client([
                'timeout' => 30,
                'http_errors' => false
            ]);
        }
        return self::$client;
    }

    public static function withHeaders(array $headers)
    {
        $instance = new self();
        $instance->headers = $headers;
        return $instance;
    }

    public static function withBaseUrl(string $baseUrl)
    {
        $instance = new self();
        $instance->baseUrl = $baseUrl;
        return $instance;
    }

    public static function post(string $url, array $data = [])
    {
        $instance = new self();
        return $instance->request('POST', $url, $data);
    }

    public static function get(string $url, array $query = [])
    {
        $instance = new self();
        return $instance->request('GET', $url, [], $query);
    }

    private function request(string $method, string $url, array $data = [], array $query = [])
    {
        $client = self::getClient();
        $url = $this->baseUrl . $url;

        $options = [
            'headers' => $this->headers,
        ];

        if (!empty($data)) {
            if (isset($data['json'])) {
                $options['json'] = $data['json'];
            } else {
                $options['json'] = $data;
            }
            
            if (isset($data['headers'])) {
                $options['headers'] = array_merge($options['headers'], $data['headers']);
            }
        }

        if (!empty($query)) {
            $options['query'] = $query;
        }

        try {
            $response = $client->request($method, $url, $options);
            $body = $response->getBody()->getContents();
            return json_decode($body, true) ?: $body;
        } catch (GuzzleException $e) {
            throw new \RuntimeException('HTTP request failed: ' . $e->getMessage());
        }
    }
}

class HttpResponse
{
    private $response;

    public function __construct($response)
    {
        $this->response = $response;
    }

    public function successful()
    {
        return $this->response->getStatusCode() >= 200 && $this->response->getStatusCode() < 300;
    }

    public function status()
    {
        return $this->response->getStatusCode();
    }

    public function body()
    {
        return (string) $this->response->getBody();
    }

    public function json()
    {
        return json_decode($this->body(), true);
    }
} 