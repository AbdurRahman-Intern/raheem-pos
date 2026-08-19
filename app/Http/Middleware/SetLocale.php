<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $availableLocales = ['en', 'ps', 'fa'];

        $locale = $request->session()->get(
            'locale',
            Setting::query()->value('language') ?? config('app.locale')
        );

        // dd([
        //     'session' => $request->session()->get('locale'),
        //     'database' => Setting::query()->value('language'),
        //     'current_locale' => app()->getLocale(),
        //     'translation' => __('menu.dashboard'),
        // ]);

        if (! in_array($locale, $availableLocales, true)) {
            $locale = config('app.locale');
        }

        App::setLocale($locale);

        return $next($request);
    }
}