<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(protected DashboardService $dashboardService) {}

    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => $this->dashboardService->stats(),
            'daily_sales' => $this->dashboardService->daily_report(),
            'weekly_sales' => $this->dashboardService->getWeeklyReports(),
            'monthly_sales' => $this->dashboardService->getMonthlyReports(),
        ]);
    }
}
