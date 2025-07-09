from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
import os
from dotenv import load_dotenv

load_dotenv()

class BaseAgent(ABC):
    """Base class for all AI agents in the Chimera system."""
    
    def __init__(self, model_name: str = "gpt-4o-mini"):
        self.llm = ChatOpenAI(
            model=model_name,
            temperature=0.1,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.name = self.__class__.__name__
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Return the system prompt that defines this agent's role and capabilities."""
        pass
    
    @abstractmethod
    def analyze(self, data: Dict[str, Any]) -> str:
        """Analyze the provided data and return insights."""
        pass
    
    def _call_llm(self, messages: list) -> str:
        """Make a call to the LLM with the given messages."""
        try:
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"Error in {self.name}: {str(e)}"
    
    def _format_data_for_analysis(self, data: Dict[str, Any]) -> str:
        """Format the data into a readable string for the LLM."""
        formatted = []
        for key, value in data.items():
            if value is not None:
                formatted.append(f"{key}: {value}")
        return "\n".join(formatted) 