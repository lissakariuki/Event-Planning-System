"use client"

import { useState, useRef } from "react"

export function useChatAnimations() {
  const [isTypingAnimationVisible, setIsTypingAnimationVisible] = useState(false)
  const typingIndicatorRef = useRef<HTMLDivElement>(null)

  // Function to show typing animation with a smooth fade in
  const showTypingAnimation = () => {
    setIsTypingAnimationVisible(true)
    if (typingIndicatorRef.current) {
      typingIndicatorRef.current.style.opacity = "0"
      typingIndicatorRef.current.style.transition = "opacity 0.3s ease-in-out"
      setTimeout(() => {
        if (typingIndicatorRef.current) {
          typingIndicatorRef.current.style.opacity = "1"
        }
      }, 10)
    }
  }

  // Function to hide typing animation with a smooth fade out
  const hideTypingAnimation = () => {
    if (typingIndicatorRef.current) {
      typingIndicatorRef.current.style.opacity = "0"
      setTimeout(() => {
        setIsTypingAnimationVisible(false)
      }, 300)
    } else {
      setIsTypingAnimationVisible(false)
    }
  }

  // Function to animate message arrival
  const animateMessageArrival = (messageElement: HTMLElement) => {
    if (messageElement) {
      messageElement.style.opacity = "0"
      messageElement.style.transform = "translateY(10px)"
      messageElement.style.transition = "opacity 0.3s ease-out, transform 0.3s ease-out"

      setTimeout(() => {
        messageElement.style.opacity = "1"
        messageElement.style.transform = "translateY(0)"
      }, 10)
    }
  }

  return {
    isTypingAnimationVisible,
    typingIndicatorRef,
    showTypingAnimation,
    hideTypingAnimation,
    animateMessageArrival,
  }
}
