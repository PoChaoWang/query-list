<?php

namespace App\Http\Controllers;

use App\Models\Query;
use App\Http\Requests\StoreOutputtingRequest;
use App\Http\Requests\UpdateOutputtingRequest;
use App\Models\Outputting;

class OutputtingController extends Controller
{
    public function store(StoreOutputtingRequest $request, Query $query)
    {
        $validated = $request->validated();

        $outputting = new Outputting();
        $outputting->query_id = $query->id;
        $outputting->sheet_id = $validated['sheetId'];
        $outputting->sheet_name = $validated['sheetName'];
        $outputting->append = $validated['append'];
        $outputting->save();

        return redirect()->route('query.show', $query->id);
    }

    public function update(UpdateOutputtingRequest $request, Query $query ,$id)
    {
        try {
            $validated = $request->validated();
            $outputting = (new Outputting())->findOrFail($id);
            $outputting->update([
                'sheet_id' => $validated['sheetId'],
                'sheet_name' => $validated['sheetName'],
                'append' => $validated['append'],
            ]);

            // Ensure the query ID is passed correctly to the route
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            \Log::error('Error updating outputting:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $outputting = (new Outputting())->findOrFail($id);
        $outputting->delete();

        return response()->json(['success' => true]);
    }

}
