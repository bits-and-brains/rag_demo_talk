<?php

namespace App\Facades;

class Log
{
    public static function info($message, array $context = [])
    {
        $contextStr = !empty($context) ? json_encode($context) : '';
        error_log("INFO: {$message} {$contextStr}");
    }

    public static function error($message, array $context = [])
    {
        $contextStr = !empty($context) ? json_encode($context) : '';
        error_log("ERROR: {$message} {$contextStr}");
    }

    public static function warning($message, array $context = [])
    {
        $contextStr = !empty($context) ? json_encode($context) : '';
        error_log("WARNING: {$message} {$contextStr}");
    }

    public static function debug($message, array $context = [])
    {
        $contextStr = !empty($context) ? json_encode($context) : '';
        error_log("DEBUG: {$message} {$contextStr}");
    }
} 