CXX ?= g++
CXXFLAGS ?= -O2 -std=c++17

all: engine

engine: main.o
	$(CXX) $(CXXFLAGS) -o engine main.o

main.o: main.cpp
	$(CXX) $(CXXFLAGS) -c main.cpp

clean:
	rm -f engine main.o