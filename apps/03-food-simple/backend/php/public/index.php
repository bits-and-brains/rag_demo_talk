<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';

// Load environment variables from .env file
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();

    // Force load into $_ENV and $_SERVER
    foreach ($_ENV as $key => $value) {
        putenv("$key=$value");
    }
} catch (\Exception $e) {
    die('Error loading .env file: ' . $e->getMessage());
}

use Slim\Factory\AppFactory;
use DI\Container;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response;
use App\Services\LLMService;
use App\Services\MarkdownService;
use App\Http\Controllers\ChatController;

// Create Container and configure dependencies
$container = new Container();
$container->set(LLMService::class, function() {
    return new LLMService();
});
$container->set(ChatController::class, function($container) {
    return new ChatController($container->get(LLMService::class), $container->get(MarkdownService::class));
});

AppFactory::setContainer($container);

// Create App
$app = AppFactory::create();

// Add CORS middleware - This must be added BEFORE routes
$app->options('/{routes:.+}', function (Request $request, Response $response) {
    return $response
        ->withHeader('Access-Control-Allow-Origin', 'http://localhost:3002')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        ->withHeader('Access-Control-Allow-Credentials', 'true');
});

$app->add(function (Request $request, RequestHandler $handler) {
    $response = $handler->handle($request);

    // Add CORS headers to every response
    return $response
        ->withHeader('Access-Control-Allow-Origin', 'http://localhost:3002')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        ->withHeader('Access-Control-Allow-Credentials', 'true');
});

// Add Error Middleware with detailed error reporting
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// Add routes
$app->get('/', function (Request $request, Response $response) {
    $response->getBody()->write('Simple food search');
    return $response;
});

// Chat routes
$app->post('/api/chat', function (Request $request, Response $response) use ($container) {
    try {
        $controller = $container->get(ChatController::class);
        $parsedBody = json_decode($request->getBody(), true);
        $result = $controller->chat($parsedBody);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

$app->get('/api/providers', function (Request $request, Response $response) use ($container) {
    try {
        $controller = $container->get(ChatController::class);
        $result = $controller->providers();
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

$app->post('/api/switch-provider', function (Request $request, Response $response) use ($container) {
    try {
        $controller = $container->get(ChatController::class);
        $parsedBody = json_decode($request->getBody(), true);
        $result = $controller->switchProvider($parsedBody);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// Run app
$app->run();
