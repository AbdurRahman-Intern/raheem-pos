<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService) {}

    /**
     * GET /reports
     * Chart/table view: period-bucketed sales, expenses, income.
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'period' => ['nullable', Rule::in(['daily', 'weekly', 'monthly'])],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $period = $validated['period'] ?? 'daily';

        $report = $this->reportService->summary(
            $period,
            $validated['from'] ?? null,
            $validated['to'] ?? null,
        );

        $report2 = $this->reportService->executiveReport(
            $period,
            $validated['from'] ?? null,
            $validated['to'] ?? null,
        );

        return Inertia::render('Reports/Index', [
            'report' => $report,
            'rep' => $report2,
            'scope' => $period,
            'filters' => [
                'period' => $period,
                'from' => $validated['from'] ?? null,
                'to' => $validated['to'] ?? null,
            ],
        ]);
    }

    /**
     * GET /reports/print
     * Executive 3-page printable report: financial, inventory, debtors.
     */
    public function print(Request $request): Response
    {
        $validated = $request->validate([
            'scope' => ['nullable', Rule::in(['daily', 'weekly', 'monthly'])],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $scope = $validated['scope'] ?? 'daily';

        $report = $this->reportService->executiveReport(
            $scope,
            $validated['from'] ?? null,
            $validated['to'] ?? null,
        );

        return Inertia::render('Reports/PrintReport', $report);
    }
}
