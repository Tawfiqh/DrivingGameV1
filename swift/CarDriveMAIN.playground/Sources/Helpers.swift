import SwiftUI
import UIKit

// MARK: - Array helpers

@discardableResult
func pushSorted<T>(_ array: inout [T], _ element: T, compareFn: (T, T) -> Double) -> Int {
    let index = binarySearchInsertIndex(array, element: element, compareFn: compareFn)
    array.insert(element, at: index)
    return index
}

private func binarySearchInsertIndex<T>(_ array: [T], element: T, compareFn: (T, T) -> Double) -> Int {
    guard !array.isEmpty else { return 0 }
    if compareFn(element, array[0]) <= 0 { return 0 }
    if compareFn(element, array[array.count - 1]) > 0 { return array.count }

    var lower = 1
    var upper = array.count - 1

    while lower <= upper {
        let mid = (lower + upper) >> 1
        let cmp = compareFn(element, array[mid])
        if cmp > 0 {
            lower = mid + 1
        } else if cmp < 0 {
            upper = mid - 1
        } else {
            return mid
        }
    }
    return lower
}

// MARK: - Numerical helpers

func varyNumberByPercentage(_ original: Double, maxVariance: Double) -> Double {
    let randomVariance = (Double.random(in: 0..<1) - 1.0) * 2.0
    return original * (1.0 + maxVariance * randomVariance)
}

func degreesToRadians(_ degrees: Double) -> Double {
    degrees * .pi / 180.0
}

// MARK: - Color helpers

func randomShadeOfBlue() -> Color {
    let red   = max(0, varyNumberByPercentage(35,  maxVariance: 0.5)  / 255.0)
    let green = max(0, varyNumberByPercentage(35,  maxVariance: 0.5)  / 255.0)
    let blue  = min(1, max(0, varyNumberByPercentage(155, maxVariance: 0.15) / 255.0))
    return Color(red: red, green: green, blue: blue)
}

func lightenColor(_ color: Color, by percentage: Double = 0.4) -> Color {
    var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
    UIColor(color).getRed(&r, green: &g, blue: &b, alpha: &a)
    return Color(
        red:   min(1.0, Double(r) * (1.0 + percentage)),
        green: min(1.0, Double(g) * (1.0 + percentage)),
        blue:  min(1.0, Double(b) * (1.0 + percentage))
    )
}
