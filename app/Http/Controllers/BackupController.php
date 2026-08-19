<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class BackupController extends Controller
{
    private function getDesktopDirectory()
    {
        // 1. Check for standard Windows Home Drive profile pathways
        if (isset($_SERVER['USERPROFILE'])) {
            $windowsDesktop = $_SERVER['USERPROFILE'].DIRECTORY_SEPARATOR.'Desktop';
            if (File::isDirectory($windowsDesktop)) {
                return $windowsDesktop;
            }
        }

        // 2. Check for Unix-based systems (macOS and Linux) using HOME env variables
        $homeDir = getenv('HOME') ?: (isset($_SERVER['HOME']) ? $_SERVER['HOME'] : null);
        if ($homeDir) {
            $unixDesktop = $homeDir.DIRECTORY_SEPARATOR.'Desktop';
            if (File::isDirectory($unixDesktop)) {
                return $unixDesktop;
            }
        }

        // Fallback option: default to the public storage path if Desktop directory can't be mapped
        return storage_path('app/public');
    }

    // public function exportToDesktop()
    // {
    //     $connection = config('database.default');
    //     $activeDatabasePath = config("database.connections.{$connection}.database");

    //     if (!File::exists($activeDatabasePath)) {
    //         return back()->with('error', 'Active SQLite database file could not be located.');
    //     }

    //     $desktopPath = $this->getDesktopDirectory();
    //     $backupFileName = 'app_db_backup_' . date('Y-m-d_H-i-s') . '.sqlite';
    //     $destinationPath = $desktopPath . DIRECTORY_SEPARATOR . $backupFileName;

    //     try {
    //         File::copy($activeDatabasePath, $destinationPath);

    //         // Pass a session flash message back to Inertia
    //         return back()->with('success', "Database snapshot generated! Saved to your Desktop as: {$backupFileName}");

    //     } catch (\Exception $e) {
    //         return back()->with('error', 'Failed to save file to Desktop: ' . $e->getMessage());
    //     }
    // }

    public function exportToDesktop()
    {
        // 1. Locate your local database file
        $connection = config('database.default');
        $activeDatabasePath = config("database.connections.{$connection}.database");

        if (! File::exists($activeDatabasePath)) {
            return back()->with('error', 'Active SQLite database file could not be located.');
        }

        // 2. Generate a clean file name based on the current date and time
        $backupFileName = 'app_db_backup_'.date('Y-m-d_H-i-s').'.sqlite';

        // 3. Use Laravel's built-in download response
        // This forces the web browser to trigger an instant download file pop-up!
        return response()->download($activeDatabasePath, $backupFileName, [
            'Content-Type' => 'application/x-sqlite3',
        ]);
    }

    public function importDatabase(Request $request)
    {
        // 1. Validate that a file is present and has the correct extension
        $request->validate([
            'backup_file' => 'required|file',
        ]);

        $uploadedFile = $request->file('backup_file');

        if ($uploadedFile->getClientOriginalExtension() !== 'sqlite') {
            return back()->with('error', 'Invalid file format. Please upload a valid .sqlite file.');
        }

        // 2. Identify the active path of your database file
        $connection = config('database.default');
        $activeDatabasePath = config("database.connections.{$connection}.database");

        try {
            // 3. CRITICAL: Disconnect active DB lines to prevent a "database is locked" crash
            DB::disconnect();

            // 4. Create a safety backup copy of the current file in case of failure
            $safetyCopyPath = $activeDatabasePath.'.bak';
            if (File::exists($activeDatabasePath)) {
                File::copy($activeDatabasePath, $safetyCopyPath);
            }

            // 5. Replace the live application database file with the new file
            File::copy($uploadedFile->getRealPath(), $activeDatabasePath);

            // 6. Delete the temporary safety copy upon a successful transaction
            if (File::exists($safetyCopyPath)) {
                File::delete($safetyCopyPath);
            }

            return back()->with('success', 'Database successfully restored from your backup file!');

        } catch (\Exception $e) {
            // Roll back to the original database file immediately if something breaks
            if (isset($safetyCopyPath) && File::exists($safetyCopyPath)) {
                File::copy($safetyCopyPath, $activeDatabasePath);
                File::delete($safetyCopyPath);
            }

            return back()->with('error', 'Failed to restore database: '.$e->getMessage());
        }
    }
}
