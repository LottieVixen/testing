for file in $(find . -name "*.png"); do
    alpha-bleeding $file "${file}.temp"
    mv "${file}.temp" $file
done
echo "Done"
