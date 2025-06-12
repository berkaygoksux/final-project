import os

# Replace 'MY_ENV_VAR' with the name of your environment variable
value = os.getenv('FAL_KEY')

if value is not None:
    print(f"FAL_KEY = {value}")
else:
    print("FAL_KEY is not set")