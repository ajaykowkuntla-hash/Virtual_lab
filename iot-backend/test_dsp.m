% test_dsp.m

% 1. Generate a simple 50 Hz sine wave
fs = 1000;            % Sampling frequency (Hz)
t = 0:1/fs:0.1;       % Time vector (0.1 seconds)
f = 50;               % Signal frequency (Hz)
x = sin(2*pi*f*t);    % Sine wave

% 2. Print a few values to stdout so we can see it in the terminal
disp('--- OCTAVE EXECUTION START ---');
disp('First 5 values of the 50 Hz sine wave:');
disp(x(1:5));

% 3. Plot the wave and save as a PNG image (Headless)
figure(1, 'visible', 'off'); % Create figure without displaying it
plot(t, x, 'b-', 'LineWidth', 2);
title('50 Hz Sine Wave');
xlabel('Time (s)');
ylabel('Amplitude');
grid on;

% Save the plot to the current directory
print('output_plot.png', '-dpng');

disp('Plot saved successfully to output_plot.png');
disp('--- OCTAVE EXECUTION END ---');
