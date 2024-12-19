rm -r node_modules

for d in packages/*
do
    echo $d
    rm -r $d/node_modules $d/dist $d/.turbo
done

for d in playground/*
do
    echo $d
    pnpm yalc remove --all
done
