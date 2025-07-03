"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react"

interface ArrayElement {
  value: number
  isComparing?: boolean
  isSwapping?: boolean
  isSorted?: boolean
}

type Algorithm = "bubble" | "selection" | "insertion"

export default function AlgorithmVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [algorithm, setAlgorithm] = useState<Algorithm>("bubble")
  const [speed, setSpeed] = useState([50])
  const [currentStep, setCurrentStep] = useState("")
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)

  const generateRandomArray = useCallback(() => {
    const newArray: ArrayElement[] = []
    for (let i = 0; i < 30; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 300) + 10,
        isComparing: false,
        isSwapping: false,
        isSorted: false,
      })
    }
    setArray(newArray)
    setCurrentStep("Array generated")
    setComparisons(0)
    setSwaps(0)
  }, [])

  useEffect(() => {
    generateRandomArray()
  }, [generateRandomArray])

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const bubbleSort = async () => {
    const arr = [...array]
    const n = arr.length

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!isRunning) return

        // Highlight comparing elements
        arr[j].isComparing = true
        arr[j + 1].isComparing = true
        setArray([...arr])
        setCurrentStep(`Comparing ${arr[j].value} and ${arr[j + 1].value}`)
        setComparisons((prev) => prev + 1)

        await sleep(101 - speed[0])

        if (arr[j].value > arr[j + 1].value) {
          // Highlight swapping elements
          arr[j].isSwapping = true
          arr[j + 1].isSwapping = true
          setArray([...arr])
          setCurrentStep(`Swapping ${arr[j].value} and ${arr[j + 1].value}`)
          setSwaps((prev) => prev + 1)

          // Swap elements
          const temp = arr[j]
          arr[j] = arr[j + 1]
          arr[j + 1] = temp
        }

        // Reset highlighting
        arr[j].isComparing = false
        arr[j + 1].isComparing = false
        arr[j].isSwapping = false
        arr[j + 1].isSwapping = false
        setArray([...arr])
      }

      // Mark as sorted
      arr[n - 1 - i].isSorted = true
      setArray([...arr])
    }

    // Mark first element as sorted
    if (arr.length > 0) {
      arr[0].isSorted = true
      setArray([...arr])
    }

    setCurrentStep("Sorting complete!")
  }

  const selectionSort = async () => {
    const arr = [...array]
    const n = arr.length

    for (let i = 0; i < n - 1; i++) {
      if (!isRunning) return

      let minIdx = i
      arr[i].isComparing = true

      for (let j = i + 1; j < n; j++) {
        if (!isRunning) return

        arr[j].isComparing = true
        setArray([...arr])
        setCurrentStep(`Finding minimum from position ${i}`)
        setComparisons((prev) => prev + 1)

        await sleep(101 - speed[0])

        if (arr[j].value < arr[minIdx].value) {
          if (minIdx !== i) arr[minIdx].isComparing = false
          minIdx = j
        } else {
          arr[j].isComparing = false
        }

        setArray([...arr])
      }

      if (minIdx !== i) {
        // Highlight swapping elements
        arr[i].isSwapping = true
        arr[minIdx].isSwapping = true
        setArray([...arr])
        setCurrentStep(`Swapping ${arr[i].value} and ${arr[minIdx].value}`)
        setSwaps((prev) => prev + 1)

        // Swap elements
        const temp = arr[i]
        arr[i] = arr[minIdx]
        arr[minIdx] = temp
      }

      // Reset highlighting and mark as sorted
      arr[i].isComparing = false
      arr[i].isSwapping = false
      if (minIdx < arr.length) {
        arr[minIdx].isComparing = false
        arr[minIdx].isSwapping = false
      }
      arr[i].isSorted = true
      setArray([...arr])
    }

    // Mark last element as sorted
    if (arr.length > 0) {
      arr[arr.length - 1].isSorted = true
      setArray([...arr])
    }

    setCurrentStep("Sorting complete!")
  }

  const insertionSort = async () => {
    const arr = [...array]
    const n = arr.length

    arr[0].isSorted = true
    setArray([...arr])

    for (let i = 1; i < n; i++) {
      if (!isRunning) return

      const key = arr[i]
      key.isComparing = true
      let j = i - 1

      setCurrentStep(`Inserting ${key.value} into sorted portion`)
      setArray([...arr])
      await sleep(101 - speed[0])

      while (j >= 0 && arr[j].value > key.value) {
        if (!isRunning) return

        arr[j].isComparing = true
        setArray([...arr])
        setComparisons((prev) => prev + 1)

        await sleep(101 - speed[0])

        arr[j + 1] = { ...arr[j] }
        arr[j].isComparing = false
        setSwaps((prev) => prev + 1)
        j--

        setArray([...arr])
      }

      arr[j + 1] = { ...key, isComparing: false, isSorted: true }
      setArray([...arr])
    }

    setCurrentStep("Sorting complete!")
  }

  const startSorting = async () => {
    setIsRunning(true)
    setIsPaused(false)

    // Reset array state
    const resetArray = array.map((item) => ({
      ...item,
      isComparing: false,
      isSwapping: false,
      isSorted: false,
    }))
    setArray(resetArray)

    try {
      switch (algorithm) {
        case "bubble":
          await bubbleSort()
          break
        case "selection":
          await selectionSort()
          break
        case "insertion":
          await insertionSort()
          break
      }
    } catch (error) {
      console.error("Sorting interrupted:", error)
    }

    setIsRunning(false)
  }

  const pauseSorting = () => {
    setIsRunning(false)
    setIsPaused(true)
    setCurrentStep("Paused")
  }

  const resetArray = () => {
    setIsRunning(false)
    setIsPaused(false)
    const resetArray = array.map((item) => ({
      ...item,
      isComparing: false,
      isSwapping: false,
      isSorted: false,
    }))
    setArray(resetArray)
    setCurrentStep("Ready to sort")
    setComparisons(0)
    setSwaps(0)
  }

  const getBarColor = (element: ArrayElement) => {
    if (element.isSorted) return "bg-green-500"
    if (element.isSwapping) return "bg-red-500"
    if (element.isComparing) return "bg-yellow-500"
    return "bg-blue-500"
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Visualizer</CardTitle>
          <CardDescription>Watch sorting algorithms work step by step with interactive controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={algorithm} onValueChange={(value: Algorithm) => setAlgorithm(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bubble">Bubble Sort</SelectItem>
                <SelectItem value="selection">Selection Sort</SelectItem>
                <SelectItem value="insertion">Insertion Sort</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={startSorting} disabled={isRunning} size="sm">
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>

              <Button onClick={pauseSorting} disabled={!isRunning} variant="outline" size="sm">
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>

              <Button onClick={resetArray} disabled={isRunning} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>

              <Button onClick={generateRandomArray} disabled={isRunning} variant="outline" size="sm">
                <Shuffle className="w-4 h-4 mr-1" />
                New Array
              </Button>
            </div>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Speed: {speed[0]}%</label>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              max={100}
              min={1}
              step={1}
              className="w-64"
              disabled={isRunning}
            />
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <Badge variant="outline">Comparisons: {comparisons}</Badge>
            <Badge variant="outline">Swaps: {swaps}</Badge>
            <Badge variant="outline">{currentStep}</Badge>
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Unsorted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Swapping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Sorted</span>
            </div>
          </div>

          {/* Visualization */}
          <div className="w-full h-80 border rounded-lg p-4 bg-gray-50 flex items-end justify-center gap-1 overflow-hidden">
            {array.map((element, index) => (
              <div
                key={index}
                className={`transition-all duration-200 ${getBarColor(element)} rounded-t`}
                style={{
                  height: `${element.value}px`,
                  width: `${Math.max(800 / array.length - 2, 8)}px`,
                  minWidth: "2px",
                }}
                title={`Value: ${element.value}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
