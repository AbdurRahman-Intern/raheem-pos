<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingRequest;
use App\Services\SettingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function __construct(protected SettingService $settingService) {}

    public function index(): Response
    {
        return Inertia::render('Settings/Index', [
            'settings' => $this->settingService->get(),
        ]);
    }

    public function update(UpdateSettingRequest $request): RedirectResponse
    {
        $this->settingService->update($request->validated());

        return redirect()->route('settings.index')->with('success', 'Settings updated successfully.');
    }

    public function changeLanguage(): RedirectResponse
    {
        $locale = request()->input('language', 'en');

        if (! in_array($locale, ['en', 'ps', 'fa'], true)) {
            $locale = 'en';
        }

        $this->settingService->updateLanguage($locale);

        return back();
    }
}
