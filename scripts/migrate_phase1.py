import sqlite3
import os
import sys

def migrate_db():
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), '..', 'iot-backend', 'database.db')
    
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        sys.exit(1)
        
    print(f"Connecting to database at {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check existing columns in experiments
    cursor.execute("PRAGMA table_info(experiments)")
    exp_columns = [col[1] for col in cursor.fetchall()]
    
    # Add columns to experiments if they don't exist
    exp_columns_to_add = {
        'theory': 'TEXT',
        'instructions': 'TEXT',
        'starter_code': 'TEXT',
        'language': 'VARCHAR'
    }
    
    for col_name, col_type in exp_columns_to_add.items():
        if col_name not in exp_columns:
            print(f"Adding column '{col_name}' to table 'experiments'")
            cursor.execute(f"ALTER TABLE experiments ADD COLUMN {col_name} {col_type};")
        else:
            print(f"Column '{col_name}' already exists in 'experiments'")
            
    # Check existing columns in lab_submissions
    cursor.execute("PRAGMA table_info(lab_submissions)")
    sub_columns = [col[1] for col in cursor.fetchall()]
    
    # Add columns to lab_submissions if they don't exist
    sub_columns_to_add = {
        'numeric_grade': 'INTEGER',
        'faculty_remarks': 'TEXT'
    }
    
    for col_name, col_type in sub_columns_to_add.items():
        if col_name not in sub_columns:
            print(f"Adding column '{col_name}' to table 'lab_submissions'")
            cursor.execute(f"ALTER TABLE lab_submissions ADD COLUMN {col_name} {col_type};")
        else:
            print(f"Column '{col_name}' already exists in 'lab_submissions'")
            
    conn.commit()
    
    # We will seed the single existing 'exp_1_dsp' experiment with realistic starter data
    # so that the dynamic frontend immediately works for it.
    starter_code_dsp = """% DSP Lab 1: Sine Wave Generation
% Parameters:
% f = Frequency in Hz
% fs = Sampling frequency in Hz
% t = Time vector

% Define your parameters here
f = 1000;
fs = 8000;
t = 0:1/fs:0.01;

% Generate and plot sine wave
% ADD YOUR CODE HERE
"""
    instructions_dsp = """In this experiment, you will generate a discrete-time sine wave and plot its samples.

Tasks:
1. Define a frequency 'f' of 1000 Hz.
2. Define a sampling frequency 'fs' of 8000 Hz.
3. Create a time vector 't' from 0 to 0.01 seconds.
4. Compute the sine wave y = sin(2 * pi * f * t).
5. Plot the result using the stem() or plot() function.
"""
    theory_dsp = """A discrete-time sinusoidal signal is mathematically defined as:
y[n] = A * sin(2 * π * f * n * T + φ)
where f is the signal frequency, and T is the sampling period (1/fs).
The Nyquist theorem requires that fs > 2*f to avoid aliasing."""

    # Update existing DSP experiment if it is empty
    cursor.execute(
        "UPDATE experiments SET starter_code = ?, instructions = ?, theory = ?, language = ? WHERE id = 'exp_1_dsp' AND (starter_code IS NULL OR starter_code = '')",
        (starter_code_dsp, instructions_dsp, theory_dsp, 'octave')
    )
    conn.commit()
    print("Database migration complete.")
    conn.close()

if __name__ == "__main__":
    migrate_db()
